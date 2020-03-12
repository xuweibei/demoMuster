import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, InputNumber } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
//业务接口方法引入
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import { getUserList } from '@/actions/admin';


const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ForecastMaintenancePersonView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            dic_Items: [],//项目字典
            itemIds: [],//选中的项目
            indeterminate: true,
            checkAll: false,
            dataSource: []
        };
       
    }
    componentWillMount(){
        // console.log(this.props)
        this.fetch();
    }
    fetch = () => {
        //realName:用户姓名
        //userType:用户类型1总部;2;大区;3分部;4教师;5学生
        //orgId:机构ID
        this.props.getUserList('',3,this.props.branchId).payload.promise.then((response)=>{
            let data = response.payload.data;  
                if(data.state == 'success'){

                    data.data.map((item) => {
                        let index = item.realName.indexOf('(');
                        item.realName = item.realName.slice(0,index);
                    })


                    this.setState({
                        dataSource:data.data
                    })
                }else{
                    message.error(data.msg);
                }
            }
        )
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
               
                let params = [];

                this.state.dataModel.map((item) => {
                    params.push(item.feePreReportId)
                })

                this.props.viewCallback({protectId: values.protectId, ids: params.join(',')});
            }
        });
    }
   
    
    //标题
    getTitle() {
        
        return `批量调整预报信息维护人员`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

  
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                break;
            case "BtchEdit":

                let lable = `您选择了${this.state.dataModel.length}名学员进行修改维护人员`;

                block_content = (
                    <Form className="search-form" >
                        <div style={{marginBottom:20}}>{lable}</div>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="请选择维护人员"
                                >  
                                {getFieldDecorator('protectId', { 
                                    initialValue: '',
                                    rules: [{
                                            required: true, message: '请设置维护人员!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value="">--请选择--</Option>
                                            {this.state.dataSource.map((item, index) => {
                                                return <Option value={item.userId} key={index}>{item.realName}&nbsp;&nbsp;&nbsp;{item.loginName}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>

                            </Col>
                            <Col span={12}></Col>
                        </Row>

                    </Form>
                );
            break;

        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedForecastMaintenancePersonView = Form.create()(ForecastMaintenancePersonView);

const mapStateToProps = (state) => {
    let branchId = state.auth.currentUser.userType.orgId;
    return {branchId};
};

function mapDispatchToProps(dispatch) {
    return {
        getUserList: bindActionCreators(getUserList, dispatch),
       
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedForecastMaintenancePersonView);

import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, InputNumber } from 'antd';

import ContentBox from '@/components/ContentBox';
//业务接口方法引入
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';

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
class TaskObjectCampusView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            dic_Items: [],//项目字典
            itemIds: [],//选中的项目
            indeterminate: true,
            checkAll: false,
        };
       
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
                if(this.props.editMode == 'Edit'){
                    params.push({
                        feeKpiId: this.state.dataModel.feeKpiId,
                        orgId: this.state.dataModel.universityId,
                        recruitBatchId: this.state.dataModel.recruitBatchId,
                        money: values.money,
                    })
                }else{

                    this.state.dataModel.map((item) => {
                        params.push({
                            feeKpiId: item.feeKpiId,
                            orgId: item.universityId,
                            recruitBatchId: item.recruitBatchId,
                            money: values.money,
                        })
                    })

                }
                // orgType 机构类型：1总部;2大区;3分部;4大客户;5高校
                this.props.viewCallback({orgType: 5, feeKpis: JSON.stringify(params)});
            }
        });
    }
   
    
    //标题
    getTitle() {
        if(this.props.editMode == 'Edit'){
            return `领航校区任务目标设置`;
        }
        return `任务目标批量设置`;
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
                block_content = (
                    <Form className="search-form">
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="招生季"
                                >  
                                  { this.state.dataModel.recruitBatchName }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="领航校区"
                                >  
                                  { this.state.dataModel.universityName }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="任务目标(¥)"
                                >  
                                  {getFieldDecorator('money', { 
                                      initialValue: this.state.dataModel.money || '',
                                      rules: [{
                                            required: true, message: '请设置任务目标金额!',
                                        }],
                                    })(
                                        <InputNumber min={1} step={1} style={{width: 170}} placeholder='请输入任务目标金额' value={this.state.dataModel.money} />
                                    )}
                                </FormItem>

                            </Col>
                            <Col span={12}></Col>
                        </Row>

                    </Form>
                );
                break;
            case "BtchEdit":

                let lable = `对${this.state.dataModel.length}条信息进行批量设置：`;

                block_content = (
                    <Form className="search-form" >
                        <div style={{marginBottom:20}}>{lable}</div>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="任务目标(¥)"
                                >  
                                {getFieldDecorator('money', { 
                                    initialValue: '',
                                    rules: [{
                                            required: true, message: '请设置任务目标金额!',
                                        }],
                                    })(
                                        <InputNumber min={0} step={1} style={{width: 170}} placeholder='请输入任务目标金额' value={this.state.dataModel.money} />
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

const WrappedTaskObjectCampusView = Form.create()(TaskObjectCampusView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
       
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTaskObjectCampusView);

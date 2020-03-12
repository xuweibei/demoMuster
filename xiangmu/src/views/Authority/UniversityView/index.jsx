import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card,Radio } from 'antd';

const RadioGroup = Radio.Group;
import './index.less'
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import AreasSelect from '@/components/AreasSelect';
const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

//业务接口方法引入
import { checkUniversityHaveFeeKpi } from '@/actions/recruit';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class UniversityView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lead:false,
            dataModel: props.currentDataModel || {},//数据模型
            leadFlag: '' 
        };
    }

    componentWillMount() {

        if(this.state.dataModel.leadFlag == 1 || this.state.dataModel.leadFlag == 0){
            this.setState({
                leadFlag: this.state.dataModel.leadFlag
            })
        }
    }

    onCancel = () => {
        this.props.viewCallback();
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '');
        return `${op}高校`;
    }

    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据

                if (values.areaId && Array.isArray(values.areaId)) {
                    values.areaId = values.areaId[values.areaId.length - 1];
                }

                if(this.state.dataModel.leadFlag == 1 && values.leadFlag == 0){

                    let params = { universityId: this.state.dataModel.universityId }
                    this.props.checkUniversityHaveFeeKpi(params).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            this.setState({ loading: false })
                            message.error(data.message);
                        }
                        else {
                            if(data.data){
                                Modal.confirm({
                                    title: this.state.dataModel.universityName+'已设置任务目标，将同时删除，您确定修改领航校区为“否”吗?',
                                    content: '点击确定保存修改信息!否则点击取消！',
                                    onOk: () => {
                                        this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                                    }
                                })
                            }else{
                                this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                            }
                        }
                    })
                }else{
                    this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                }
                
            }
        });

    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确定</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
    leadChange = (value) => {
        
        this.setState({
            leadFlag: value.target.value
        })
        
    }
    //多种模式视图处理
    renderEditModeOfView() { 
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <FormItem
                            {...searchFormItemLayout}
                            label="高校名称"
                        >
                            {getFieldDecorator('universityName', {
                                initialValue: this.state.dataModel.universityName,
                                rules: [{
                                    required: true, message: '请输入高校名称!',
                                }],
                            })(
                                <Input placeholder="请输入高校名称" />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="高校编码"
                        >
                            {getFieldDecorator('universityCode', {
                                initialValue: this.state.dataModel.universityCode,
                                rules: [{
                                    required: true, message: '请输入高校编码!',
                                }],
                            })(
                                <Input placeholder="请输入高校编码" />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="高校级别"
                        >
                            {getFieldDecorator('universityLevel', { 
                                initialValue: dataBind(this.state.dataModel.universityLevel),
                                rules: [{
                                    required: true, message: '请选择高校级别!',
                                }],
                            })(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    {this.props.university_level.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="区域"
                        >
                            {getFieldDecorator('areaId', { 
                                initialValue: this.state.dataModel.areaId,
                                rules: [{
                                    required: true, message: '请选择区域!',
                                }],
                             })(
                               <AreasSelect
                                  value={this.state.dataModel.areaId}
                                  areaName={this.state.dataModel.areaName}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('state', { 
                                initialValue: dataBind(this.state.dataModel.state),
                                rules: [{
                                    required: true, message: '请选择状态!',
                                }],
                             })(
                                <Select>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem> 
                        <FormItem {...searchFormItemLayout} label="领航校区">
                            {getFieldDecorator('leadFlag', {
                            initialValue: dataBind(this.state.dataModel.leadFlag),
                            rules: [{
                                required: true, message: '请选择是否领航校区!',
                            }],
                            })(
                            <RadioGroup 
                                value={dataBind(this.state.dataModel.leadFlag)} 
                                hasFeedback
                                onChange={this.leadChange}
                            >
                                <Radio value='1' >是</Radio>
                                <Radio value='0' >否</Radio>
                            </RadioGroup>
                            )}
                        </FormItem> 
                        {
                            this.state.leadFlag == 1 && <FormItem {...searchFormItemLayout} label="所属分部">
                            {getFieldDecorator('branchId', {
                                initialValue: this.state.dataModel.branchId,
                                rules: [{
                                    required: true, message: '请选择所属分部!',
                                }],
                            })(
                                <SelectFBOrg scope={'all'} hideAll={false} />
                                )}
                        </FormItem>
                        } 
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
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedUniversityView = Form.create()(UniversityView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { currentUser } = state.auth;
    let { Dictionarys } = state.dic;
    return { currentUser, Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        checkUniversityHaveFeeKpi: bindActionCreators(checkUniversityHaveFeeKpi, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUniversityView);
